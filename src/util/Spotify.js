const clientId = "d23d684bb68b4e5dbe24b4b3e7f42404";
let userAccessToken;
const redirectURI = "http://localhost:3000/";

const Spotify = {
    getAcessToken() {
        if(userAccessToken) {
            return userAccessToken;
        }

        const acessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (acessTokenMatch && expiresInMatch) {
            userAccessToken = acessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
            window.setTimeout(() => userAccessToken = '', expiresIn * 1000);
            window.history.pushState('Acess Token', null, '/');

            return userAccessToken;
        }

        else {
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
            window.location = accessUrl;
        }
    },

    search(searchTerm) {
        const accessToken = Spotify.getAcessToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${searchTerm}`, 
        {
            headers: {Authorization: `Bearer ${accessToken}`}
        })
        .then((response) => {
            return response.json();
        }).then((jsonResponse) => {
            if(!jsonResponse.tracks) {
                return [];
            }

            return jsonResponse.tracks.items.map((track) => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri

            }))
        })
    },

    savePlaylist(playlistName, trackUris) {
        if(!playlistName || !trackUris.length) {
            return;
        }

        const accessToken = Spotify.getAcessToken();
        const headers = {
            Authorization: `Bearer ${accessToken}`
        }
        let userId;

        return fetch('htpps://api.spotify.com/v1/me', {headers: headers}).then((response) => {
            return response.json();
        }).then((jsonResponse) => {
            userId = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({name: playlistName})
            }).then((response) => {
                return response.json();
            }).then((jsonResponse) => {
                const playlistId = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({uris: trackUris})
                });
            });
        });
    }
}


    
export default Spotify;