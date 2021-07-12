import React, { useEffect } from 'react';

const Comments = () => {
  useEffect(() => {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-uterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', true);
    script.setAttribute('repo', 'aaronvb/aaronvb.github.io');
    script.setAttribute('issue-term', 'title');
    script.setAttribute('theme', 'github-light');
    anchor.appendChild(script);
  });

  return (
    <div id='inject-comments-for-uterances'></div>
  );
};

export default Comments;
