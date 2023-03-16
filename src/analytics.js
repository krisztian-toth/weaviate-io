export const analyticsSiteSearched = (searchTerm) =>
    plausible('Site Search', {
        props: { searchTerm }
    });

export const analyticsSiteSearchSelected = (searchTerm, uri, title) =>
    plausible('Site Search Selected', {
        props: { 
            searchTerm,
            uri,
            title, 
            summary: JSON.stringify({searchTerm, uri, title}) 
        }
    });