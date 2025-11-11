import { useState, useEffect, useCallback } from "react";

export const getPaymentTimeLimit = (paymentMethod: string): number => {
  // Returns time limit in seconds
  if (paymentMethod === "qris") {
    return 10 * 60; // 10 minutes
  } else if (["gopay", "ovo", "dana", "shopeepay", "linkaja"].includes(paymentMethod)) {
    return 15 * 60; // 15 minutes
  } else if (["bca", "mandiri", "bni", "bri", "cimb", "permata"].includes(paymentMethod)) {
    return 24 * 60 * 60; // 24 hours
  }
  return 15 * 60; // Default 15 minutes
};

export const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return "00:00:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const usePaymentTimer = (paymentMethod: string, isActive: boolean = true) => {
  const timeLimit = getPaymentTimeLimit(paymentMethod);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isExpired, setIsExpired] = useState(false);

  const reset = useCallback(() => {
    setTimeRemaining(timeLimit);
    setIsExpired(false);
  }, [timeLimit]);

  useEffect(() => {
    if (!isActive) return;
    
    setTimeRemaining(timeLimit);
    setIsExpired(false);
    
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentMethod, timeLimit, isActive]);

  const formattedTime = formatTimeRemaining(timeRemaining);
  const progressPercentage = (timeRemaining / timeLimit) * 100;

  return {
    timeRemaining,
    formattedTime,
    isExpired,
    progressPercentage,
    reset,
  };
};
