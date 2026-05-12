import logging
import httpx
import os

from app.core.config import settings

# Setup Logger
logger = logging.getLogger(__name__)

async def send_whatsapp_group_message(message: str) -> None:
    """
    Mengirim pesan teks ke grup WhatsApp melalui API pihak ketiga (WAHA).
    Berjalan secara asinkron agar tidak memblokir event loop.
    """
    if not settings.WAHA_GROUP_ID or not settings.WAHA_API_URL:
        logger.warning("WAHA credentials not set in .env. Skipping WhatsApp notification.")
        return
        
    payload = {
        "session": "default",
        "chatId": settings.WAHA_GROUP_ID,
        "text": message
    }
    
    headers = {
        "Accept": "application/json"
    }
    if settings.WAHA_API_KEY:
        headers["X-Api-Key"] = settings.WAHA_API_KEY
        
    # Timeout 10 detik agar tidak hang jika server WA API mati
    timeout = httpx.Timeout(10.0)
    
    logger.info(f"Mengirim payload ke WAHA: {payload}")
    
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(settings.WAHA_API_URL, json=payload, headers=headers)
            
            # Raise exception jika HTTP status code bukan 2xx
            response.raise_for_status()
            
            logger.info(f"Berhasil mengirim notifikasi WA ke grup {settings.WAHA_GROUP_ID}")
            
    except httpx.HTTPStatusError as e:
        logger.error(
            f"Gagal mengirim notifikasi WA. HTTP Error: {e.response.status_code} - {e.response.text}"
        )
    except httpx.RequestError as e:
        logger.error(f"Gagal mengirim notifikasi WA. Koneksi bermasalah: {e}")
    except Exception as e:
        logger.error(f"Terjadi error tidak terduga saat mengirim WA: {e}")
