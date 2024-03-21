import React from 'react'
import { Slider } from '@mui/material'

interface SliderInputProps {
    label: string
    value: number
    min?: number
    max?: number
    step?: number
    disabled?: boolean
    onChange: (value: number) => void
}

const SliderInput = ({ label, value, onChange, min = 0, max = 100, step = 1, disabled }: SliderInputProps) => {
    return (
        <>
            <label htmlFor={ label }>{ label }</label>
            <Slider
                id={ label }
                min={ min }
                max={ max }
                value={ value } 
                disabled={ disabled }
                onChange={ (e, v) => onChange(v as number) }
                step={ step }/>
        </>
    )
}

export default SliderInput