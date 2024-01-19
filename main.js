// main.js

//=======================================================
// on mouseover, highlight the video being moused over.
//=======================================================
document.addEventListener('mouseover', handleMouseOver);

// on mouseover, if the target is a video, make note of the vidLink and update the highlight mask.
function handleMouseOver(event) {
  let vidEl = getVideoEl(event.target);
  if (vidEl != null) {
    
    let linkEl = vidEl.querySelector('#video-title-link');

    updateHighlight(vidEl, linkEl.href);
  }
}

// the highlight is a unique div that will serve the dual purpose of preventing the video underneath
// from being clicked. It will save the link info of the video it's covering up.
function updateHighlight(target, vidLink) {
  let highlightEl = document.getElementById("highlight-wrap");
  if (highlightEl == null) {
    highlightEl = document.createElement("div");
    highlightEl.id = 'highlight-wrap';
    highlightEl.style.position = 'absolute';
    highlightEl.style.backgroundColor = '#6ee06e';
    highlightEl.style.opacity = '0.5';
    highlightEl.style.cursor = 'crosshair';
    //highlightEl.style.pointerEvents = 'none';
    document.body.appendChild(highlightEl);
  }
  let rect = target.getBoundingClientRect();
  highlightEl.style.left = (rect.left + window.scrollX - 12) + "px";
  highlightEl.style.top = (rect.top + window.scrollY - 12) + "px";
  highlightEl.style.width = rect.width + 24 + "px";
  highlightEl.style.height = rect.height + 24 + "px";
  highlightEl.setAttribute('vidLink', vidLink);
}

// Given an element that might be a child of a video, return the parent element representing the video.
// Returns null for non-video elements.
function getVideoEl(element) {
  // query for the element encompassing a yt video thumbnail/title card
  const selector = 'ytd-rich-grid-row ytd-rich-item-renderer';
  
  if (element.matches(selector)) {
    return element;
  }

  // Check if any ancestor of the element matches the selector
  let currentElement = element;
  while (currentElement.parentElement) {
    currentElement = currentElement.parentElement;
    if (currentElement.matches(selector)) {
      return currentElement;
    }
  }

  return null;
}

//==============================================================================
// on click, create a playlist of videos up to that point
//==============================================================================
document.addEventListener('click', handleClickEvent);

function handleClickEvent(event) {
  // get the video URL
  const highlightEl = document.getElementById("highlight-wrap");
  const vidLink = highlightEl.getAttribute('vidLink')
  const stopVideoId = getVidId(vidLink);

  // stop the mouseover highlight
  document.removeEventListener('mouseover', handleMouseOver);
  highlightEl.remove();
  
  // handleClickEvent should only fire once
  document.removeEventListener('click', handleClickEvent);
  
  // get all video IDs preceding (newer than) the selected video
  const vidtype = "subscriptions";
  const titleEls = document.querySelectorAll("ytd-two-column-browse-results-renderer[page-subtype='" + vidtype + "'] a#video-title-link");
  let videoIds = [];

  for (const title of titleEls) {
    const videoId = getVidId(title.href);
    if (videoId) {
      videoIds.push(videoId);
      if (videoId === stopVideoId) break;
    }
  }
  videoIds = videoIds.reverse(); // oldest video first

  // construct a playlist link
  const limit = 100; // avoid getting too close to URL character limit
  videoIds = videoIds.slice(0, limit);
  let playlistLink = "https://www.youtube.com/watch_videos?video_ids=" + videoIds.join(',');

  // send a message to popup.js which has the tab creation capability
  chrome.runtime.sendMessage({ action: 'openNewTab', url: playlistLink });
}

function getVidId(url) {
  // Regular expression to match YouTube video URLs of the form https://www.youtube.com/watch?v=<ID>
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}