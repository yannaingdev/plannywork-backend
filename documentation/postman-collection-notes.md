## Postman Collection: PlannyWorkLocalhost

- File: `documentation/PlannyWorkLocalhost.postman_collection.json`
- Global variable expected: `{{URL}}` → `http://localhost:5500/api/v1`
- Auth note: the backend uses session cookies; the collection still includes legacy bearer-token scripts. Run a login request first to capture cookies in Postman, and keep `{{URL}}` set to the base API URL.

### Import & setup
1) In Postman, `File > Import` and select the JSON file above.  
2) Set a Global (or Environment) variable `URL = http://localhost:5500/api/v1`.  
3) Run one of the login requests (e.g., `Auth > Login DemoUserA`) so Postman stores the session cookie for subsequent calls. The bearer token variable is not required by the current backend but is left in the collection for backward compatibility.

### Folder overview
- **Auth**: register, login (demo user/supervisor), logout, updateUser, getcurrentuser.
- **Jobs**: save draft, submit, list, detail, update, delete.
- **Stat**: stats endpoint.
- **Home**: basic health/root requests.
- **FileStorage**: file upload helper.
- **KeyAccounts**:
  - `Create Key Account` (POST `{{URL}}/key-accounts`) with body:
    ```json
    {
      "name": "Alpha Clinic",
      "address": "123 Demo St, Downtown",
      "description": "Primary site",
      "lat": 1.3521,
      "lng": 103.8198
    }
    ```
  - `Get Key Accounts` currently uses POST to `{{URL}}/key-accounts` in the exported collection; the live API supports `GET /key-accounts` (and `mine=true` to filter). Adjust the request method if you prefer GET.

### Tips
- Keep the server running on port 5500 before sending requests.
- If CORS blocks browser requests, Postman is unaffected; just ensure the correct cookie is stored after login.
- For KeyAccount distance filtering, use query params: `?lat=16.8&lng=96.15&radius=8000` (GET). For user-only results: `?mine=true`.

## Route specifics (other folders)

**Auth**
- `Register User` (POST `{{URL}}/auth/register`): body requires `name`, `email`, `password`.
- `Login DemoUserA` / `Login Supervisor` (POST `{{URL}}/auth/login`): sets the session cookie. Keep `{{URL}}` as above.
- `Update User` (PATCH `{{URL}}/auth/updateUser`): body requires `email`, `name`, `lastName`, `location`.
- `Me` (GET `{{URL}}/auth/getcurrentuser`): returns the current session user; requires the session cookie.

**Jobs**
- `Save Draft` (POST `{{URL}}/jobs/draft`): multipart/form-data allowed; minimal payload includes `jobSheetNo` and optional `jobDate` (JSON stringified date). Requires session.
- `Submit Job` (POST `{{URL}}/jobs/:id/submit`): use a valid job id and session cookie.
- `Get All Jobs` (GET `{{URL}}/jobs`): supports `status`, `jobType`, `sort`, `search`, `page`. Requires session.
- `Job Detail` (GET `{{URL}}/jobs/:id`): requires session.
- `Update Job` (PATCH `{{URL}}/jobs/:id`): supports multipart with optional `attachedFile`. Requires session.
- `Delete Job` (DELETE `{{URL}}/jobs/:id`): requires session.

**Stat**
- `Stats` (GET `{{URL}}/stats`): returns status aggregates and monthly/weekly/daily counts. Requires session.

**FileStorage**
- `Generate Upload URL` (POST `{{URL}}/files` or the specific route present in the collection): used for presigned URLs; requires session.

**Home**
- `Root` / `Health` (GET `{{URL}}/` or `/api/v1`): basic availability checks; no auth required.
