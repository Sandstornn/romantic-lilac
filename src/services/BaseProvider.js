/**
 * 직접 사용하지 않고, 반드시 상속받아서 사용
 */
export default class BaseProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    /* 각 자식 class에서 구현 */
    this.baseUrl = ""; 
  }


  async search(query) {
    throw new Error("search() 메서드를 구현해야 합니다!");
  }

  // 상세 정보를 가져오는 기능
  async getDetail(id) {
    throw new Error("getDetail() 메서드를 구현해야 합니다!");
  }
}