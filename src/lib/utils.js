import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

import React from 'react'

function utils() {
  return (
    <div>utils</div>
  )
}

export default utils