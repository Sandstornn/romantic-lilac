export default function Navbar() {
  const genres = ['movie', 'drama', 'animation', 'game', 'music', 'book'];

  return (
    <nav id="index_Home_page">
      <div id="title_Home_page">
        <h1>Romantic<br />Lilac</h1>
      </div>
      <div id="container_genre">
        <ul>
          {genres.map((genre) => (
            /* div 대신 li에 직접 클래스를 주는 게 정석 */
            <li key={genre} className="genre">
              <a>{genre}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}