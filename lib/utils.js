
// Helper to find links in text
export const extractVideoLink = (text) => {
    if (!text) return null;
    // Matches http://, https://, or www.
    const urlRegex = /((?:https?:\/\/|www\.)[^\s]+)/g;
    const match = text.match(urlRegex);
    if (match) {
        let url = match[0];
        // Ensure protocol exists for the anchor tag to work correctly
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }
        return url;
    }
    return null;
};

// Fallback to YouTube Search if no ID found
export const getSearchUrl = (term) => `https://www.youtube.com/results?search_query=${encodeURIComponent(term + ' exercise tutorial')}`;
