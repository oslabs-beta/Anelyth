const app = require('./../server/server');
const request = require('supertest')(app);
const expect = require('chai').expect;

describe('Express', () => {
  describe('Creating routes', (done) => {
    it('GET request to /messages return status code of 200', () => {
      request
        .get('/messages')
        .expect(200,done);
    });

    it('GET request to /messages returns messages array of message', (done) => {
      request
        .get('/messages')
        .end((err, res) => {
          expect(JSON.parse(res.text)).to.be.a('array');
          done();
        });
    });

    it('POST request to /messages returns status code of 200 if message formatted correctly', (done) => {
      request
        .post('/messages')
        .set('Authorization', 'Basic secret_key')
        .send({message: 'test', created_by: 'tester'})
        .expect(200,done);
    });

    it('POST request to /messages returns status code of 400 if message formatted incorrectly', (done) => {
      request
        .post('/messages')
        .send({message: 'test'})
        .expect(400,done);
    });

    it('Successful POST request adds message', (done) => {
      let length;
      request
        .get('/messages')
        .end((err, res) => {
          length = JSON.parse(res.text).length;

          request.post('/messages')
            .send({message: 'test', created_by: 'tester'})
            .set('Authorization', 'Basic secret_key')
            .expect(200)
            .end((err,res) => {
              request
                .get('/messages')
                .end((err, res) => {
                  const newLength = JSON.parse(res.text).length;
                  expect(newLength).to.eql(length + 1);
                  done();
                });
          })
        })
    });

    it('Unsuccessful POST request do not add message', (done) => {
      let length;
      request
        .get('/messages')
        .end((err, res) => {
          length = JSON.parse(res.text).length;

          request.post('/messages')
            .send({message: 'test'})
            .expect(400)
            .end((err,res) => {
              request
                .get('/messages')
                .end((err, res) => {
                  const newLength = JSON.parse(res.text).length;
                  expect(newLength).to.eql(length);
                  done();
                });
          })
        })
    });

    it('POST request to /messages returns success object if message formatted correctly', (done) => {
      request
        .post('/messages')
        .send({message: 'test', created_by: 'tester'})
        .set('Authorization', 'Basic secret_key')
        .end((err, res) => {
          expect(JSON.parse(res.text)).to.have.property('success');
          done();
        });
    });

    it('POST request to /messages returns error object if message formatted incorrectly', (done) => {
      request
        .post('/messages')
        .send({message: 'test'})
        .set('Authorization', 'Basic secret_key')
        .end((err, res) => {
          const body = JSON.parse(res.text);
          expect(body).to.have.property('error');
          expect(body.error).to.eql('Your POST request was unsuccessful');
          done();
        });
    });
  });

  describe('Authorization',(done) => {
    it('Unauthorized users should be sent denied object', (done) => {
      request
        .post('/messages')
        .send({message: 'test', created_by: 'tester'})
        .set('Authorization', 'Basic incorrect_key')
        .end((err, res) => {
          const body = JSON.parse(res.text);
          expect(body).to.have.property('error');
          expect(body.error).to.eql('Your password is incorrect');
          done();
        });
    });

    it('Unauthorized users should be sent denied object', (done) => {
      request
        .post('/messages')
        .send({message: 'test', created_by: 'tester'})
        .set('Authorization', 'secret_key')
        .end((err, res) => {
          const body = JSON.parse(res.text);
          expect(body).to.have.property('error');
          expect(body.error).to.eql('Your password is incorrect');
          done();
        });
    });
  });

});
