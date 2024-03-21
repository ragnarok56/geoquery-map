import React from 'react'
import { IconButton } from '@mui/material'

import { styled } from '@mui/material'

const StyledIconControlButton = styled(IconButton)(({ theme }) => ({
    margin: theme.spacing(.5),
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: theme.palette.primary.light,
    padding: theme.spacing(1),
    borderRadius: 0,
    "&:hover": {
        backgroundColor: theme.palette.primary.light
    }
}))


// component style with `sx` prop, but read this can dynamically generate way too many css stylesheets 
// and may not be that good
const IconControlButton = (props: any) => {
    return (
        <IconButton sx={ {
            margin: theme => theme.spacing(1),
            color: (theme) => theme.palette.primary.contrastText,
            backgroundColor: (theme) => theme.palette.primary.main,
            borderTop: 2,
            borderBottom: 2,
            borderLeft: 2,
            borderRight: 2,
            borderColor: (theme) => theme.palette.primary.light,
            padding: theme => theme.spacing(1),
            borderRadius: 0,
            "&:hover": {
                backgroundColor: theme => theme.palette.primary.light
            }
        } }
        { ...props }>
            { props.children }
        </IconButton>
    )
}

export default StyledIconControlButton