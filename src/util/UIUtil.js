import { formatDistance } from 'date-fns'

export function formatDate(ms, justDate = false) {
  if (!ms) {
    return ''
  }
  const dif = Date.now() - ms
  const date = new Date(ms)
  if (dif > 1000 * 60 * 60 * 24 * 30) {
    if (justDate) {
      return date.toLocaleDateString();
    }
    return date.toLocaleString();
  }
  return formatDistance(date, new Date(), { addSuffix: true })

}
export function getUserName(user) {
  let result = "";
  if (user.name) {
    result = user.name + " ";
  }
  if (user.lastname) {
    result += user.lastname;
  }
  if (result.length == 0) {
    result = user.email;
  }
  return result;
}

export function getUserLetter(user) {
  let result = ''
  if (user.name) {
    result += user.name.substring(0, 1).toUpperCase();
    if (user.lastname) {
      result += user.lastname.substring(0, 1).toUpperCase();
    }
  } else {
    let parts = user.email.split('.')
    if (parts.length > 0) {
      result += parts[0].substring(0, 1).toUpperCase();
    }
    if (parts.length > 1) {
      result += parts[1].substring(0, 1).toUpperCase();
    }
  }
  return result
}