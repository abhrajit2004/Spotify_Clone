let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
   if(isNaN(seconds) || seconds<0){
    return "00:00";
   }

   const minutes = Math.floor(seconds / 60);

   const remainingSeconds = Math.floor(seconds % 60);

   const formattedMinutes = String(minutes).padStart(2, '0');
   const formattedSeconds = String(remainingSeconds).padStart(2, '0');

   return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
     const element = as[index];
     if(element.href.endsWith(".mp3")){
        songs.push(element.href.split(`/${folder}/`)[1]);
     }
   }

   let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
   songUL.innerHTML = "";
   for (const song of songs) {
       songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
       <div class="info">
           <div>${song.replaceAll("%20"," ")}</div>
           <div>Abhra</div>
       </div>
       <div class="playNow flex justify-content items-center">
           <span>Play Now</span>
           <img class="invert playNowButton" src="img/play.svg" alt="">
       </div></li>`;   
   }
   Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
       e.addEventListener("click",()=>{
           // console.log(e.querySelector(".info").firstElementChild.innerHTML);
           playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
       })
   })

   return songs;
}

const playMusic = (track, pause=false)=>{
    currentSong.src = `/${currFolder}/` + track;
    if(!pause){
        currentSong.play();
        playSong.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");   
    div.innerHTML = response; 
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
        // console.log(e.href);
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            if(e.href.includes("/songs") && !e.href.includes(".htaccess")){
              let folder = e.href.split("/").slice(-2)[0];
              let a = await fetch(`/songs/${folder}/info.json`);
              let response = await a.json();
              // console.log(response);
              cardContainer.innerHTML = cardContainer.innerHTML +  `
                     <div data-folder="${folder}" class="card">
                        <div class="play">
                        <img class="playbutton" src="img/playbutton.svg" alt="">
                        </div>
                        <img class="songimage" src="/songs/${folder}/cover.jpg" alt="">
                         <h2>${response.title}</h2>
                        <p>${response.description}</p>
                   </div>`
            
            }
        }

        Array.from(document.getElementsByClassName("card")).forEach((e)=>{
          e.addEventListener("click",async(item)=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })

}

async function main() {
    
    await getSongs("songs/ncs");
    playMusic(songs[0], true);
    // console.log(songs);

    displayAlbums();

    playSong.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play();
            playSong.src = "img/pause.svg";
        }
        else{
            currentSong.pause();
            playSong.src = "img/play.svg";
        }

    })

    currentSong.addEventListener("timeupdate",()=>{
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent)/100;
    })

    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "0";
    })

    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "-120%";
    })

    prevSong.addEventListener("click",()=>{
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if(index-1 >= 0){
          playMusic(songs[index-1]);
        }
    })

    nextSong.addEventListener("click",()=>{
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if(index+1 < songs.length){
          playMusic(songs[index+1]);
        }   
    })
    
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        // console.log(e, e.target, e.target.value);
        currentSong.volume = parseInt(e.target.value)/100;
        if(currentSong.volume > 0){
            document.querySelector(".volume > img").src = document.querySelector(".volume > img").src.replace("img/mute.svg","img/volume.svg");
        }
    })

    document.querySelector(".volume > img").addEventListener("click",(e)=>{
        if(e.target.src.includes("img/volume.svg")){
            e.target.src = e.target.src.replace("img/volume.svg","img/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("img/mute.svg","img/volume.svg");
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

    
}
main()