import { useState, useEffect } from 'react'
import { ArrowDown, Link, Share2, Check } from 'lucide-react'

// Default values
const DEFAULT_WEEKS = 10
const DEFAULT_RATES = {
  response: 4,
  screening: 65,
  technical: 30,
  team: 50,
  offer: 50,
  acceptance: 50,
}

export default function PipelineCalculator() {
  const [copied, setCopied] = useState(false)

  // Initialize state from URL or use defaults
  const getInitialState = () => {
    if (typeof window === 'undefined')
      return { weeksToHire: DEFAULT_WEEKS, rates: DEFAULT_RATES }

    const params = new URLSearchParams(window.location.search)
    const weeksToHire = parseInt(params.get('weeks') || '') || DEFAULT_WEEKS
    const rates = {
      response:
        parseFloat(params.get('response') || '') || DEFAULT_RATES.response,
      screening:
        parseFloat(params.get('screening') || '') || DEFAULT_RATES.screening,
      technical:
        parseFloat(params.get('technical') || '') || DEFAULT_RATES.technical,
      team: parseFloat(params.get('team') || '') || DEFAULT_RATES.team,
      offer: parseFloat(params.get('offer') || '') || DEFAULT_RATES.offer,
      acceptance:
        parseFloat(params.get('acceptance') || '') || DEFAULT_RATES.acceptance,
    }

    return { weeksToHire, rates }
  }

  const initialState = getInitialState()
  const [weeksToHire, setWeeksToHire] = useState(initialState.weeksToHire)
  const [rates, setRates] = useState(initialState.rates)

  // Check if URL had params on initial load
  const [hadInitialParams] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.location.search.length > 0
  })

  // Auto-update URL if there were initial params (shared link)
  useEffect(() => {
    if (typeof window === 'undefined' || !hadInitialParams) return

    const params = new URLSearchParams()
    params.set('weeks', weeksToHire.toString())
    params.set('response', rates.response.toString())
    params.set('screening', rates.screening.toString())
    params.set('technical', rates.technical.toString())
    params.set('team', rates.team.toString())
    params.set('offer', rates.offer.toString())
    params.set('acceptance', rates.acceptance.toString())

    const hash = window.location.hash
    const newUrl = `${window.location.pathname}?${params.toString()}${hash}`
    window.history.replaceState({}, '', newUrl)
  }, [weeksToHire, rates, hadInitialParams])

  // Scroll to calculator on mount if hash is present
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (window.location.hash === '#calculator') {
      setTimeout(() => {
        const element = document.getElementById('calculator')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }, [])

  // Calculate pipeline volumes working backwards from 1 hire
  const calculatePipeline = (pipelineRates: typeof rates) => {
    const r = pipelineRates
    const volumes = {
      accepted: 0,
      offered: 0,
      team: 0,
      technical: 0,
      screening: 0,
      response: 0,
      outreach: 0,
    }

    volumes.accepted = 1
    volumes.offered = volumes.accepted / (r.acceptance / 100)
    volumes.team = volumes.offered / (r.offer / 100)
    volumes.technical = volumes.team / (r.team / 100)
    volumes.screening = volumes.technical / (r.technical / 100)
    volumes.response = volumes.screening / (r.screening / 100)
    volumes.outreach = volumes.response / (r.response / 100)

    return volumes
  }

  const volumes = calculatePipeline(rates)
  const weeklyOutreach = Math.ceil(volumes.outreach / weeksToHire)

  const updateRate = (stage: string, value: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue < 0 || numValue > 100) return

    setRates({
      ...rates,
      [stage]: numValue,
    })
  }

  type VolumeKey = keyof typeof volumes
  type RateKey = keyof typeof rates

  const stages: Array<{
    key: string
    label: string
    volumeKey: VolumeKey
    rate: RateKey | null
  }> = [
    {
      key: 'outreach',
      label: 'Initial Outreach',
      volumeKey: 'outreach',
      rate: null,
    },
    {
      key: 'response',
      label: 'Response/Interest',
      volumeKey: 'response',
      rate: 'response',
    },
    {
      key: 'screening',
      label: 'Screening Call Booked',
      volumeKey: 'screening',
      rate: 'screening',
    },
    {
      key: 'technical',
      label: 'Take-Home Exercise',
      volumeKey: 'technical',
      rate: 'technical',
    },
    { key: 'team', label: 'Team Interview', volumeKey: 'team', rate: 'team' },
    {
      key: 'offered',
      label: 'Offer Extended',
      volumeKey: 'offered',
      rate: 'offer',
    },
    {
      key: 'accepted',
      label: 'Offer Accepted',
      volumeKey: 'accepted',
      rate: 'acceptance',
    },
  ]

  const handleCopyShareLink = async () => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams()
    params.set('weeks', weeksToHire.toString())
    params.set('response', rates.response.toString())
    params.set('screening', rates.screening.toString())
    params.set('technical', rates.technical.toString())
    params.set('team', rates.team.toString())
    params.set('offer', rates.offer.toString())
    params.set('acceptance', rates.acceptance.toString())

    const baseUrl = window.location.origin + window.location.pathname
    const url = `${baseUrl}?${params.toString()}#calculator`

    window.history.replaceState({}, '', url)

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  return (
    <div id="calculator" className="w-full min-w-full">
      <div className="w-full overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="w-8"></th>
              <th className="p-4 text-left font-medium">Pipeline Stage</th>
              <th className="border-l p-4 text-center">Rate</th>
              <th className="border-l p-4 text-center">Volume</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((stage, index) => {
              const isLast = index === stages.length - 1
              const isOutreach = stage.key === 'outreach'

              return (
                <tr key={stage.key} className="border-b">
                  <td className="p-4 text-center">
                    {!isLast && <ArrowDown className="mx-auto h-4 w-4" />}
                  </td>

                  <td className="p-4">
                    <span>{stage.label}</span>
                  </td>

                  <td className="border-l p-4 text-center">
                    {stage.rate ? (
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          value={rates[stage.rate]}
                          onChange={(e) =>
                            updateRate(stage.rate!, e.target.value)
                          }
                          className="w-16 rounded border px-2 py-1 text-center"
                          min="0"
                          max="100"
                          step="1"
                        />
                        <span>%</span>
                      </div>
                    ) : (
                      <span>—</span>
                    )}
                  </td>

                  <td className="border-l p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={
                          isOutreach ? 'text-accent-cyan font-semibold' : ''
                        }
                      >
                        {Math.ceil(volumes[stage.volumeKey])}
                      </span>
                      {isOutreach && <Link className="h-4 w-4" />}
                    </div>
                  </td>
                </tr>
              )
            })}

            <tr>
              <td colSpan={4} className="p-0">
                <hr className="border-t-2" />
              </td>
            </tr>

            <tr className="bg-muted/30 border-b">
              <td className="bg-muted/30 p-4"></td>
              <td className="bg-muted/30 p-4">
                <span className="font-medium">Total Outreach</span>
              </td>
              <td className="bg-muted/30 border-l p-4 text-center">
                <span>—</span>
              </td>
              <td className="bg-muted/30 border-l p-4 text-center">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <div className="text-accent-cyan font-semibold">
                      {Math.ceil(volumes.outreach)}
                    </div>
                    <Link className="h-4 w-4" />
                  </div>
                  <div className="mt-1 text-xs">touches needed</div>
                </div>
              </td>
            </tr>

            <tr className="bg-muted/30 border-b">
              <td className="bg-muted/30 p-4"></td>
              <td className="bg-muted/30 p-4">
                <span className="font-medium">Weeks to Hire</span>
              </td>
              <td className="bg-muted/30 border-l p-4 text-center">
                <span>—</span>
              </td>
              <td className="bg-muted/30 border-l p-4 text-center">
                <input
                  type="number"
                  value={weeksToHire}
                  onChange={(e) =>
                    setWeeksToHire(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-20 rounded border px-2 py-1 text-center"
                  min="1"
                />
              </td>
            </tr>

            <tr className="bg-muted/30">
              <td className="bg-muted/30 p-4"></td>
              <td className="bg-muted/30 p-4">
                <span className="font-medium">Per Week</span>
              </td>
              <td className="bg-muted/30 border-l p-4 text-center">
                <span>—</span>
              </td>
              <td className="bg-muted/30 border-l p-4 text-center">
                <div className="text-accent-blue font-semibold">
                  {weeklyOutreach}
                </div>
                <div className="mt-1 text-xs">outreach per week</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleCopyShareLink}
          className="border-border bg-background hover:bg-muted/50 text-foreground flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              <span>Copy Share Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
