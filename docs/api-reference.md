# Care-Track Database API Reference

This document will cover the Supabase database schema and the various client APIs for the Care-Track app.  The data access goes through the [Supabase JavaScript client](https://supabase.com/docs/reference/javascript/introduction), which uses the automatically generated REST API with Row Level Security being enforced automatically.

## Setup
```bash
npm install @supabase/supabase-js
```

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.https://pjlhwswfghcwwgpxhwba.supabase.co/
  process.env.sb_publishable_Hq8gjb1Quhekk6zvOKxbJA__BNY2E2h
)
```


