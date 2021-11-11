export const ConvertNumberToGrade = (number: number) => {
    if (number >= 80) return 'A'
    if (number >= 75) return 'B+'
    if (number >= 70) return 'B'
    if (number >= 65) return 'C+'
    if (number >= 60) return 'C'
    if (number >= 55) return 'D+'
    if (number >= 50) return 'D'
    if (number < 50) return 'F'
}

export const ConvertNumberToNumberGrade = (number: number) => {
    if (number >= 80) return '4.0'
    if (number >= 75) return '3.5'
    if (number >= 70) return '3.0'
    if (number >= 65) return '2.5'
    if (number >= 60) return '2.0'
    if (number >= 55) return '1.5'
    if (number >= 50) return '1.0'
    if (number < 50) return '0'
}
