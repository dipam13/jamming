const clientId = 'client_id';
// const redirectURI = 'http://simplistic-winter.surge.sh/';
const redirectURI = 'http://localhost:3000/';
let accessToken;

const Spotify = {

    getAccessToken() {
        alert(accessToken);
        if(accessToken) {
            return accessToken;
        } 
        //check the access token match
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if(accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expireIn = Number(expiresInMatch[1]);

            // This clears the paramaters, allowing us to grab a new access token when it expires.

            window.setTimeout(() => accessToken = '', expireIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            const accessURL = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
            window.location = accessURL;
        }
    },

    search(term) {
        const accessToken = Spotify.getAccessToken();
        
        console.log(accessToken);
        
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`  
            }
        }).then(response => {
            // alert(response.json())
            return response.json();
        }).then(jsonResponse => {
            if(!jsonResponse.tracks) {
                return [];
            }
            return  jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name: track.name, 
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri
            }));
        });
    },

    savePlayList(name, trackURIs) {
        if (!name && !trackURIs.length) {
            return;
        }

        const accessToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}`};
        let userId; 
        // const baseURI = 'https://api.spotify.com';
        
        return fetch('https://api.spotify.com/v1/me', { headers: headers })
                .then(response => response.json())
                .then(jsonResponse => {
                    userId = jsonResponse.id;
                    return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                        headers: headers,
                        method: 'POST',
                        body: JSON.stringify({ name: name})
                    })
                    .then(response => response.json())
                    .then(jsonResponse => {
                        const playlistId = jsonResponse.id;
                        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
                            headers: headers,
                            method: 'POST',
                            body: JSON.stringify({ uri: trackURIs})
                        })
                    })
                })
    }

}

export default Spotify;