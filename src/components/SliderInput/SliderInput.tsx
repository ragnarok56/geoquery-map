import React from 'react'

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
            <input
                id={ label }
                type="range" 
                min={ min }
                max={ max }
                value={ value } 
                disabled={ disabled }
                onChange={ (e) => onChange(Number(e.target.value)) }
                step={ step }/>
        </>
    )
}

export default SliderInput