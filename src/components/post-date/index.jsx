import React from 'react'

import './index.scss'

export const PostDate = ({ date, category }) => {
  return (
    <div>
      <p className="post-date">
        <span>{category} | </span>
        <span className="thumbnail-date" style={{ color: '#3f526b' }}>
          {date}
        </span>
      </p>
      <br></br>
    </div>
  )
}
