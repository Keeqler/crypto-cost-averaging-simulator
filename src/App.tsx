import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LinearScale,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import axios from 'axios'
import formatDate from 'date-fns/format'
import Skeleton from 'react-loading-skeleton'
import PuffLoader from 'react-spinners/PuffLoader'

import { Input } from './components/Input'
import { Result, ResultGreenRed, ResultLabel, ResultSymbol, ResultValue } from './components/Result'
import { Select } from './components/Select'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const assetOptions = [
  { value: 'bitcoin', label: 'Bitcoin', icon: '/bitcoin.svg' },
  { value: 'binance-coin', label: 'Binance Coin', icon: '/binance-coin.svg' },
  { value: 'cardano', label: 'Cardano', icon: '/cardano.svg' },
  { value: 'ethereum', label: 'Ethereum', icon: '/ether.svg' },
  { value: 'litecoin', label: 'Litecoin', icon: '/litecoin.svg' },
  { value: 'monero', label: 'Monero', icon: '/monero.svg' },
  { value: 'xrp', label: 'Ripple', icon: '/xrp.svg' },
  { value: 'zcash', label: 'Zcash', icon: '/zcash.svg' },
]

const basisOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

const startMonthOptions = [
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' },
  { value: '05', label: 'May' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Aug' },
  { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' },
]

const startYearOptions = [
  { value: '2010', label: '2010' },
  { value: '2011', label: '2011' },
  { value: '2012', label: '2012' },
  { value: '2013', label: '2013' },
  { value: '2014', label: '2014' },
  { value: '2015', label: '2015' },
  { value: '2016', label: '2016' },
  { value: '2017', label: '2017' },
  { value: '2018', label: '2018' },
  { value: '2019', label: '2019' },
  { value: '2020', label: '2020' },
  { value: '2021', label: '2021' },
  { value: '2022', label: '2022' },
]

const assetsMarketStartYear: Record<string, number> = {
  bitcoin: 2010,
  'binance-coin': 2017,
  cardano: 2017,
  ethereum: 2015,
  litecoin: 2013,
  monero: 2014,
  xrp: 2014,
  zcash: 2016,
}

const api = axios.create({ baseURL: 'https://data.messari.io/api' })

const formatMoney = (amount: number) =>
  amount.toLocaleString('en', { maximumFractionDigits: 2, minimumFractionDigits: 2 })

const formatPercentage = (percentage: number) =>
  `${percentage >= 0 ? '+' : ''}${percentage.toLocaleString('en', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}%`

type TResults = {
  entryPrice: number
  currentPrice: { price: number; change: number }
  averagePrice: number
  amountInvested: number
  netPnl: { amount: number; change: number }
  totalReturn: number
  returnGrowth: { data: number[]; labels: string[] }
}

const App = () => {
  const [asset, setAsset] = useState(assetOptions[0].value)
  const [amount, setAmount] = useState(20)
  const [basis, setBasis] = useState(basisOptions[0].value)
  const [startMonth, setStartMonth] = useState(startMonthOptions[0].value)
  const [startYear, setStartYear] = useState('2016')
  const [results, setResults] = useState<TResults | null>(null)

  useEffect(() => {
    ;(async () => {
      setResults(null)

      if (Number(startYear) < assetsMarketStartYear[asset]) {
        setStartYear(assetsMarketStartYear[asset].toString())
        return
      }

      try {
        // 0 timestamp
        // 1 open
        // 2 high
        // 3 low
        // 4 close
        // 5 volume

        const timeSeriesResponse = await api.get(`/v1/assets/${asset}/metrics/price/time-series`, {
          params: {
            start: `${startYear}-${startMonth}-01`,
            end: new Date().toISOString().slice(0, 10),
            interval: '1w',
          },
        })

        const marketDataResponse = await api.get(`/v1/assets/${asset}/metrics/market-data`)

        const series = timeSeriesResponse.data.data.values as number[][]
        let buyPrices: number[] = []

        if (basis === 'weekly') {
          buyPrices = series.map((value: number[]) => value[4])
        } else {
          const dateToBuyPriceMap: Record<string, number> = {}

          series.forEach(values => {
            const date = new Date(values[0])
            const monthYear = `${date.getMonth()}/${date.getFullYear()}`

            if (!(monthYear in dateToBuyPriceMap)) {
              dateToBuyPriceMap[monthYear] = values[4]
            }
          })

          buyPrices = Object.values(dateToBuyPriceMap)
        }

        const currentPrice = marketDataResponse.data.data.market_data.price_usd
        const entryPrice = buyPrices[0]
        const currentPriceChangePerc = (currentPrice / entryPrice) * 100 - 100

        const averagePrice =
          buyPrices.reduce((total: number, price: number) => total + price, 0) / buyPrices.length

        const totalUsdInvested = buyPrices.length * amount

        const totalAssetAmount = buyPrices.reduce(
          (total: number, price: number) => amount / price + total,
          0
        )

        const totalWorthUsd = totalAssetAmount * currentPrice
        const assetBuyAmounts = buyPrices.map(price => amount / price)
        let returnGrowth: number[] = []

        assetBuyAmounts.reduce((total, buyAmount, index) => {
          const sum = total + buyAmount
          returnGrowth.push(sum * buyPrices[index])
          return sum
        }, 0)

        returnGrowth = returnGrowth.filter(
          (v, i) => (i + 1) % parseInt((buyPrices.length / 20).toString()) === 0
        )

        returnGrowth[returnGrowth.length - 1] = totalWorthUsd

        const returnGrowthLabels = new Array(20).fill('')
        returnGrowthLabels[0] = formatDate(new Date(series[0][0]), 'LLL yyyy')
        returnGrowthLabels[19] = formatDate(new Date(), 'LLL yyyy')

        setResults({
          entryPrice,
          currentPrice: { price: currentPrice, change: currentPriceChangePerc },
          averagePrice,
          amountInvested: totalUsdInvested,
          netPnl: {
            amount: totalWorthUsd - totalUsdInvested,
            change: (totalWorthUsd / totalUsdInvested) * 100 - 100,
          },
          totalReturn: totalWorthUsd,
          returnGrowth: {
            data: returnGrowth,
            labels: returnGrowthLabels,
          },
        })
      } catch {}
    })()
  }, [asset, amount, basis, startMonth, startYear])

  return (
    <main className='max-w-[780px] min-h-screen mx-auto p-4 pt-16 flex flex-col gap-16'>
      <div className='w-full mx-auto flex flex-col sm:flex-row justify-between gap-16'>
        <div className='max-w-xs p-4 flex flex-col self-start flex-grow gap-4 rounded-lg bg-neutral-8'>
          <Select label='Asset' options={assetOptions} value={asset} setValue={setAsset} />
          <Input
            label='Amount per purchase (USD)'
            value={String(amount)}
            setValue={v => setAmount(Number(v))}
          />
          <Select label='Basis' options={basisOptions} value={basis} setValue={setBasis} />

          <div className='grid grid-cols-2 gap-2'>
            <Select
              label='Start date'
              options={startMonthOptions}
              value={startMonth}
              setValue={setStartMonth}
            />
            <Select
              label=''
              options={startYearOptions.filter(
                option => Number(option.value) >= assetsMarketStartYear[asset]
              )}
              value={startYear}
              setValue={setStartYear}
            />
          </div>
        </div>

        <div className='w-full sm:max-w-xs min-h-[625px] flex flex-col flex-grow gap-4'>
          <h1>Results</h1>

          <Result>
            <ResultLabel>Entry price</ResultLabel>
            <ResultValue>
              {!!results && (
                <>
                  {formatMoney(results.entryPrice)}&nbsp;<ResultSymbol>USD</ResultSymbol>
                </>
              )}
              {!results && <Skeleton width={100} />}
            </ResultValue>
          </Result>

          <Result>
            <ResultLabel>Current price</ResultLabel>
            <ResultValue>
              {!!results && (
                <>
                  {formatMoney(results.currentPrice.price)}
                  &nbsp;
                  <ResultSymbol>USD</ResultSymbol>&nbsp;
                  <ResultGreenRed percentage={results.currentPrice.change}>
                    ({formatPercentage(results.currentPrice.change)})
                  </ResultGreenRed>
                </>
              )}
              {!results && <Skeleton width={120} />}
            </ResultValue>
          </Result>

          <Result>
            <ResultLabel>Average price</ResultLabel>
            <ResultValue>
              {!!results && (
                <>
                  {formatMoney(results.averagePrice)}&nbsp;<ResultSymbol>USD</ResultSymbol>
                </>
              )}
              {!results && <Skeleton width={110} />}
            </ResultValue>
          </Result>

          <Result>
            <ResultLabel>Amount invested</ResultLabel>
            <ResultValue>
              {!!results && (
                <>
                  {formatMoney(results.amountInvested)}&nbsp;<ResultSymbol>USD</ResultSymbol>
                </>
              )}
              {!results && <Skeleton width={100} />}
            </ResultValue>
          </Result>

          <Result>
            <ResultLabel>Total return</ResultLabel>
            <ResultValue>
              {!!results && (
                <>
                  {formatMoney(results.totalReturn)}
                  &nbsp;
                  <ResultSymbol>USD</ResultSymbol>
                  &nbsp;
                  <ResultGreenRed percentage={results.netPnl.change}>
                    {results.netPnl.amount >= 0 && '+'}
                    {formatMoney(results.netPnl.amount)}&nbsp;USD&nbsp;(
                    {formatPercentage(results.netPnl.change)})
                  </ResultGreenRed>
                </>
              )}
              {!results && <Skeleton width={200} />}
            </ResultValue>
          </Result>

          <Result className='flex-grow'>
            <ResultLabel>Return growth (USD)</ResultLabel>
            {!results && <PuffLoader color='#3D4347' cssOverride={{ margin: 'auto' }} />}
            {!!results && (
              <Line
                className='mt-2'
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: { bodyFont: { family: 'IBM Plex Sans' }, displayColors: false },
                  },
                  scales: {
                    xAxes: {
                      ticks: {
                        autoSkip: false,
                        maxRotation: 0,
                        minRotation: 0,
                        color: '#97A9B5',
                        font: { size: 13 },
                      },
                    },
                    yAxes: {
                      ticks: {
                        format: { maximumFractionDigits: 2 },
                        color: '#E2F5FF',
                        font: { size: 13 },
                      },
                    },
                  },
                  font: { family: 'IBM Plex Sans' },
                }}
                data={{
                  labels: results.returnGrowth.labels,
                  datasets: [
                    {
                      data: results.returnGrowth.data,
                      borderColor: '#00A3FF',
                      pointBackgroundColor: '#00000000',
                      tension: 0.5,
                      pointRadius: 0,
                      pointHitRadius: 10,
                    },
                  ],
                }}
              />
            )}
          </Result>
        </div>
      </div>

      <article>
        <h1>So, what on earth is cost averaging?</h1>

        <p className='text-neutral-2 leading-relaxed'>
          Cost averaging is the practice of investing a fixed amount on a regular basis, regardless
          of the asset price. It&apos;s a good way to develop a disciplined investing habit, be more
          efficient in how you invest and potentially lower your stress level—as well as your costs.{' '}
          <br />
          <a
            href='https://intelligent.schwab.com/article/dollar-cost-averaging'
            target='_blank'
            rel='noreferrer'
            className=''
          >
            Read the full article
          </a>{' '}
        </p>
      </article>

      <footer className='mt-auto text-neutral-2'>
        <p>
          Market data provided by{' '}
          <a href='https://messari.io' target='_blank' rel='noreferrer'>
            Messari
          </a>{' '}
        </p>

        <p>
          Powered by ☕️, made by{' '}
          <a href='https://github.com/Keeqler' target='_blank' rel='noreferrer'>
            Keeqler
          </a>
          <span className='text-neutral-9 cursor-default'>
            &nbsp; duvido que tu achou isso sem olhar o código
          </span>
        </p>
      </footer>
    </main>
  )
}

export default App
