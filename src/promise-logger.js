

class PromiseLogger {
    constructor(id) {
        this.id = id;
    }

    onStart() {
        this.log(`Promise ${this.id} started`);
    }

    onSuccess(r) {
        this.log(`Promise ${this.id} completed successfully`);
    }

    onError(e) {
        this.log(`Promise ${this.id} failed with error ${e.message}`);
    }

    log(message) {
        console.log(message);
    }

    attach(promise) {
        this.onStart();
        promise.then(r => {
            this.onSuccess(r);
            return r;
        }).catch(e => {
            this.onError(e);
            throw e;
        });

        return promise;
    }
}

module.exports = PromiseLogger;
