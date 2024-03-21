import React from 'react'
import { Box } from '@mui/material'

import { styled } from '@mui/material'

const Panel = styled(Box)(({ theme }) => ({
    margin: 0,
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: theme.palette.primary.light,
    padding: theme.spacing(1),
    borderRadius: 0,
}))


export default Panel