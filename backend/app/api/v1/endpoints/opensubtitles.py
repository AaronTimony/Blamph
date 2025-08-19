from fastapi import APIRouter, HTTPException, Header, Depends
from typing import Optional
import requests
import base64
from app.core.config import settings

router = APIRouter()
"""In this file I just keep the core functions relating to this api and the api endpoint in the same file just so all the opensubtitles stuff is contained in one file to make it a bit easier."""

def search_subtitles(anime_name: str):
    url = "https://api.opensubtitles.com/api/v1/subtitles"
    headers = {
        "Api-key" : settings.OPENSUBS_API,
        "Content-Type" : "application/json",
        "User-Agent" : "Blamph v1"
    }
    params = {
        "query": anime_name,
        
    }

    try:
        response = requests.get(url, headers=headers, params=params, timeout=5)
        response.raise_for_status()
        data = response.json()
        if not data["data"]:
            raise HTTPException(status_code=404, detail="No subtitles found")
        
        # Pick the first subtitle file from the results
        subtitle_entry = data["data"][0]
        file_id = subtitle_entry["attributes"]["files"][0]["file_id"]
        return file_id

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"OpenSubtitles API error: {str(e)}")

@router.get("/test-file-id")
def test_file_id(anime_name: str):
    file_id = search_subtitles(anime_name)
    return {"anime_name": anime_name, "file_id": file_id}
