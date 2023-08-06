type RoleTypes = 'ADMIN' | 'MODERATOR' | 'READER';

export default function getRoleId(type: RoleTypes) {
  switch (type) {
    case 'ADMIN':
      return 1;
    case 'MODERATOR':
      return 2;
    case 'READER':
      return 3;
  }
}
