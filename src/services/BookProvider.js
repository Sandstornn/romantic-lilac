// src/services/BookProvider.js

class BookProvider {
  constructor(supabaseUrl) {
    // 이제 API 키는 프론트엔드에 필요 없습니다. 엣지 펑션이 들고 있으니까요!
    this.endpoint = `${supabaseUrl}/functions/v1/rapid-worker`;
  }

  // 검색 및 무한 스크롤 (20개씩)
  async search(query, page = 1) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'book',
          type: 'search',
          query: query,
          page: page
        })
      });

      if (!response.ok) throw new Error('도서 검색 실패');
      return await response.json(); // 엣지에서 이미 20개 배열로 예쁘게 가공해서 줄 겁니다.
    } catch (error) {
      console.error("Book Search Error:", error);
      return [];
    }
  }

  // 상세 정보 가져오기 (객체 하나)
  async fetchBookById(id) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'book',
          type: 'detail',
          id: id
        })
      });

      if (!response.ok) throw new Error('도서 상세 정보 실패');
      return await response.json(); // 엣지에서 객체 하나로 줄 겁니다.
    } catch (error) {
      console.error("Book Detail Error:", error);
      return null;
    }
  }
}

export default BookProvider;