import React from 'react';
import PublicationCard from './PublicationCard';
import './PublicationList.css';

const PublicationList = ({ posts, onPostUpdate, onPostDelete }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="no-posts">
        <p>Aucune publication à afficher. Soyez le premier à publier !</p>
      </div>
    );
  }

  return (
    <div className="publication-list">
      {posts.map((post) => (
        <PublicationCard 
          key={post._id} 
          post={post}
          onPostUpdate={onPostUpdate}
          onPostDelete={onPostDelete}
        />
      ))}
    </div>
  );
};

export default PublicationList;