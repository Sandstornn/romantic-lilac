export default function Navbar({ onLogoClick, onGenreClick }) {
  const genres = ['movie', 'drama', 'animation', 'game', 'music', 'book'];

  return (
    <nav id="index_Home_page">
      <div id="title_Home_page"
      onClick={onLogoClick}
      style={{ cursor: 'pointer' }}
      >
        <h1>Romantic<br />Lilac</h1>
      </div>
      <div id="container_genre">
        <ul>
          {genres.map((genre) => (
            /* div 대신 li에 직접 클래스를 주는 게 정석 */
            <li key={genre} 
              className="genre" 
              onClick={() => onGenreClick(genre)} // 클릭된 장르명 알려주기
              style={{ cursor: 'pointer' }}
            >
              <a>{genre}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}