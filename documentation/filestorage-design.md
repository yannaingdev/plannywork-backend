```
                         ┌──────────────────────┐
                         │      Frontend        │
                         │  (Next.js / Client)  │
                         └──────────┬───────────┘
                                    │
                 Upload (XHR/POST)  │   Download (GET)
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Express Backend    │
                         │   /api/v1/jobs       │
                         └──────────┬───────────┘
                                    │
            ┌───────────────────────┼────────────────────────┐
            │                       │                        │
            ▼                       ▼                        ▼
   ┌────────────────┐     ┌──────────────────┐      ┌────────────────┐
   │ Auth Middlewar │     │ Job Controller   │      │ File Controller│
   │ Session / JWT  │     │ - submit()       │      │ - upload()     │
   └────────────────┘     │ - updateStatus()  │     │ - download()   │
                          └─────────┬──────────┘    └───────┬────────┘
                                    │                         │
                                    ▼                         ▼
                          ┌──────────────────┐      ┌────────────────────┐
                          │   MongoDB        │      │   File Storage     │
                          │ - jobs           │      │ - Local / S3       │
                          │ - attachments    │      │ - Path reference   │
                          └──────────────────┘      └────────────────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │   Response       │
                          │ JSON / Stream    │
                          └──────────────────┘
```
