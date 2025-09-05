import { Card, CardActionArea, CardContent, CardMedia, Grid, Stack, TextField, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { getCourses } from '../lib/contentful'

export function Catalog() {
  const [q, setQ] = useState('')
  const key = useMemo(() => ['courses', q] as const, [q])
  const { data, isLoading, isError } = useQuery({ queryKey: key, queryFn: () => getCourses() })

  if (isLoading) return <Typography>Loading...</Typography>
  if (isError) return <Typography color="error">Failed to load</Typography>

  const items = data ?? []

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Catalog</Typography>
      <TextField placeholder="Search" value={q} onChange={e => setQ(e.target.value)} />
      <Grid container spacing={2}>
        {items.map(p => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
            <Card>
              <CardActionArea component={RouterLink} to={`/courses/${p.id}`}>
              <CardMedia component="img" height={140} image={p.fields.coverUrl || 'https://via.placeholder.com/400x200?text=Course'} alt={p.fields.title} />
              <CardContent>
                <Typography variant="subtitle1">{p.fields.title}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>{p.fields.description}</Typography>
              </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}

export default Catalog


