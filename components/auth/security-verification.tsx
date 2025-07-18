"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefreshCw, Shield, CheckCircle } from "lucide-react"

interface SecurityVerificationProps {
  onVerify: (isValid: boolean) => void
  disabled?: boolean
}

export function SecurityVerification({ onVerify, disabled = false }: SecurityVerificationProps) {
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [isVerified, setIsVerified] = useState(false)

  const generateNewProblem = () => {
    setNum1(Math.floor(Math.random() * 10) + 1)
    setNum2(Math.floor(Math.random() * 10) + 1)
    setUserAnswer("")
    setIsVerified(false)
    onVerify(false)
  }

  useEffect(() => {
    generateNewProblem()
  }, [])

  useEffect(() => {
    const answer = Number.parseInt(userAnswer)
    const correctAnswer = num1 + num2
    const isCorrect = answer === correctAnswer && userAnswer !== ""

    setIsVerified(isCorrect)
    onVerify(isCorrect)
  }, [userAnswer, num1, num2, onVerify])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Shield className="h-4 w-4" />
        <span>Security Verification</span>
        {isVerified && (
          <div className="flex items-center gap-1 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs">Verified</span>
          </div>
        )}
      </div>

      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="captcha" className="text-sm text-gray-600 mb-2 block">
              Please solve this math problem:
            </Label>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white px-3 py-2 rounded border border-gray-300 font-mono text-lg font-semibold text-gray-800">
                {num1} + {num2} = ?
              </div>
            </div>
            <Input
              id="captcha"
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Enter your answer"
              disabled={disabled}
              className={`h-10 ${
                isVerified
                  ? "border-green-500 bg-green-50 focus:border-green-600"
                  : "border-gray-300 focus:border-blue-500"
              }`}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateNewProblem}
            disabled={disabled}
            className="h-10 px-3 border-gray-300 hover:border-gray-400 hover:bg-gray-50 bg-transparent"
            title="Generate new problem"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
