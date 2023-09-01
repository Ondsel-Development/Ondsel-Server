import os
import requests
from flask import Flask, render_template

app = Flask(__name__)
SRC_URL = os.getenv('SHAREFRONTEND_SRC_URL')
API_URL = os.getenv('SHAREFRONTEND_API_URL')


def get_share_detail(link_id):
    url = f'{API_URL}/shared-models/{link_id}'
    print(url)
    response = requests.get(url)
    if response.status_code != 200:
        return False, {}
    return True, response.json()

@app.route('/')
def index():  # put application's code here
    return '<html><body>Ondsel Share Link Server</body></html>'


@app.route('/share/<link_id>')
def share(link_id):
    (good_flag, detail) = get_share_detail(link_id)
    return render_template(
        'share.html',
        link_id=link_id,
        share_url=SRC_URL,
        good_flag=good_flag,
        detail=detail
    )


if __name__ == '__main__':
    app.run()
