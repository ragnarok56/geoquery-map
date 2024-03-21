import React, { useState } from 'react'
import IconControlButton from './ControlButton'
import { Popover, PopoverProps } from '@mui/material'

interface PopoverControlButtonProps {
    icon: any
    children: any
}

const PopoverControlButton = ({ icon, children }: PopoverControlButtonProps) => {
    const [anchorElement, setAnchorElement] = useState<HTMLButtonElement | null>(null);
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorElement(event.currentTarget)
    }

    const handleClose = () => setAnchorElement(null)

    const open = !!anchorElement
    const id = open ? 'simple-popover' : undefined

    return (
        <>
            <IconControlButton onClick={ handleClick } aria-describedby={id}>
                { icon }
            </IconControlButton>
            <Popover 
                open={ open }
                onClose={ handleClose }
                anchorEl={ anchorElement }
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}>
                { children }
            </Popover>
        </>
    )
}

export default PopoverControlButton