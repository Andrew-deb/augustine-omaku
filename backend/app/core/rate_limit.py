from slowapi import Limiter
from slowapi.util import get_remote_address

# The key_func tells slowapi HOW to identify each unique client.
# get_remote_address extracts the IP from the incoming request.
#
# In production behind a reverse proxy (Nginx, Cloudflare), you may
# need to switch to a function that reads X-Forwarded-For instead.
limiter = Limiter(key_func=get_remote_address)
