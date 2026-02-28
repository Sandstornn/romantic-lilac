import BaseProvider from './BaseProvider';

export default class MovieProvider extends BaseProvider {
  constructor(apiKey) {
    super(apiKey);
    this.baseUrl = "https://api.themoviedb.org/3";
  }


  async search(query,page=1) {
    if (!query) return [];

    const response = await fetch(
      `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&page=${page}&language=ko-KR`
    );
    const data = await response.json();

    // API마다 결과 형식이 다르니, 우리 앱이 쓰기 편한 형태로 통일
    return data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      subTitle: movie.release_date ? movie.release_date.split('-')[0] : '정보 없음', // 출시 연도
      image: movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
        : 'https://via.placeholder.com/500x750?text=No+Image', // 포스터 없으면 대체 이미지
      description: movie.overview,
      rating: movie.vote_average
    }));
  }

  async getDetail(id) {
    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${this.apiKey}&language=ko-KR`;
    const response = await fetch(url);
    const data = await response.json();
    return {
      id: data.id,
      title: data.title,
      image: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
      overview: data.overview
    };
  }
}