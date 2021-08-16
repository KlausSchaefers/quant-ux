export default class GitService {

  constructor(token) {

  }

  saveFile(data) {
    return new Promise(function(resolve, reject) {
       data.repository.write(
          data.branchName,
          data.filename,
          data.content,
          data.commitTitle,
          function(err) {
             if (err) {
                reject(err);
             } else {
                resolve(data.repository);
             }
          }
       );
    });
 }

}