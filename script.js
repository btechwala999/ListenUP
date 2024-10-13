let currentSong = new Audio();
let currfolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
    currfolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    let songUL = document.querySelector(".songLists").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="assets/svg/music.svg" alt="">
        <div class="info">
            <div>${song.replace(".mp3", "").replaceAll("%20", " ")}</div>
            <div></div>
        </div>
        <div class="playnow">
            <span>Play</span>
            <img class="invert" src="assets/svg/play.svg" alt="">
        </div> </li>`;
    }

    Array.from(document.querySelector(".songLists").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // Get the displayed song name and re-add ".mp3" when passing to playMusic
            let track = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playMusic(track);  // The playMusic function will handle adding ".mp3" if needed
        });
    });
    

    return songs

}

function updatePlayTextColor(track) {
    // Reset the color of all play buttons
    document.querySelectorAll(".songLists ul li .playnow").forEach(element => {
        element.innerHTML = `<span>Play</span>
            <img class="invert" src="assets/svg/play.svg" alt="">`;  // Reset all play button colors
    });

    // More precise targeting: Find the specific unordered list for songs within the current folder
    let songLists = document.querySelectorAll(".songLists ul");

    // Loop through all song lists and their list items to find and update the correct song
    songLists.forEach(songList => {
        let songItems = songList.querySelectorAll("li");  // Target all list items in this specific list
        
        songItems.forEach(item => {
            let songName = item.querySelector(".info").firstElementChild.innerHTML.trim();

            // Compare the current song name with the playing track (decode both to ensure accuracy)
            if (decodeURIComponent(songName) === decodeURIComponent(track).replace(".mp3", "")) {
                let playButton = item.querySelector(".playnow");
                playButton.innerHTML =  `<img id="wave" src="assets/svg/wave.svg" alt="">
            <img class="invert" src="assets/svg/play.svg" alt="">` // Set active play button color
            }
        });
    });
}



const playMusic = (track, pause = false) => {
    // Add ".mp3" back when setting the song src if it's missing
    let songWithExtension = track.endsWith(".mp3") ? track : track + ".mp3";
    
    // Set the source of the current song
    currentSong.src = `${currfolder}/${songWithExtension}`;  // Correctly set the current song source
    
    if (!pause) {
        currentSong.play();
        play.innerHTML = `<img src="assets/svg/pause.svg" alt="">`;  // Update play button to pause symbol
        updatePlayTextColor(track);  // Highlight currently playing track
    }

    // Update the song info in the UI (without the .mp3 extension)
    document.querySelector(".songinfo").innerHTML = decodeURI(track).replace(".mp3", "");
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";  // Reset song time initially
}



async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/Songs`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/Songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            let a = await fetch(`http://127.0.0.1:3000/Songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="49" height="49">
                                <circle cx="12" cy="12" r="12" fill="#1fdf64" />
                                <polygon points="9,7 9,17 17,12" fill="#000000" />
                            </svg>

                        </div>
                        <img src="/Songs/${folder}/cover.jpg" alt="">
                        <span>${response.description}</span>

                    </div>`
        }

    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
            updatePlayTextColor(songs[0])
        })
    })
}

async function main() {
    await getSongs("Songs/Krishna")

    playMusic(songs[0], true)

    displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();

            // Replace the play button's innerHTML with the pause button
            play.innerHTML = `<img src="assets/svg/pause.svg" alt="">`;
        } else {
            currentSong.pause();

            // Replace the pause button with the play button
            play.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="34"
                                height="34">
                                <circle cx="12" cy="12" r="12" fill="currentcolor" />
                                <polygon points="9,7 9,17 17,12" fill="#000000" />
                            </svg>`;
        }
    });

    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            // Play the next song if there is one
            playMusic(songs[index + 1]);
        } else {
            // If it's the last song, stop and reset the play button
            play.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="34"
            height="34">
            <circle cx="12" cy="12" r="12" fill="currentcolor" />
            <polygon points="9,7 9,17 17,12" fill="#000000" />
            </svg>`;
        }
        updatePlayTextColor(track);
    });



    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"

    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
            updatePlayTextColor(songs[index - 1]); 
        }
    })

    next.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
            updatePlayTextColor(songs[index + 1]);
        }
    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100

        if (currentSong.volume > 0.3 && currentSong.volume < 0.7) {
            volume.src = "assets/svg/volume30.svg"
        }
        else if (currentSong.volume > 0.7) {
            volume.src = "assets/svg/volume70.svg"
        }
        else if (currentSong.volume == 0) {
            volume.src = "assets/svg/mute.svg"
        }
        else {
            volume.src = "assets/svg/volume.svg"
        }
    })

    document.querySelector(".volume>img").addEventListener("click", e => {

        // Extract the filename of the image (last part of the URL)
        const imgSrc = e.target.src.split('/').pop();  // Get the last part of the URL
        console.log(imgSrc);

        if (imgSrc.includes("volume.svg") || imgSrc.includes("volume30.svg") || imgSrc.includes("volume70.svg")) {
            // Replace any volume image with 'novolume.svg'
            e.target.src = e.target.src.replace(imgSrc, "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            console.log(imgSrc);
        } else if (imgSrc.includes("mute.svg")) {
            // Replace 'novolume.svg' back to 'volume.svg'
            e.target.src = e.target.src.replace(imgSrc, "volume.svg");
            currentSong.volume = 0.1;
            console.log(e.target.src);
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
            console.log(imgSrc);
        }
    });


}

main()