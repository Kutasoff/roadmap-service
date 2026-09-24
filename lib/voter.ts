export function getVoterId(): string {
    const key = 'voter_id';
    let id = localStorage.getItem(key);
  
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
  
    return id;
  }