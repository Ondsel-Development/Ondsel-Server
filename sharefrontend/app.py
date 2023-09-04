import os
import requests
from flask import Flask, render_template, abort, Response

app = Flask(__name__)
SRC_URL = os.getenv('SHAREFRONTEND_SRC_URL')
API_URL = os.getenv('SHAREFRONTEND_API_URL')
SELF_URL = os.getenv('SHAREFRONTEND_SELF_URL')


def get_share_detail(link_id):
    url = f'{API_URL}/shared-models/{link_id}'
    response = requests.get(url)
    if response.status_code != 200:
        return False, {}
    return True, response.json()


def get_sitemap():
    # http://localhost:3030/sitemaps?websiteTarget=share.ondsel.com
    url = f'{API_URL}/sitemaps?websiteTarget=share.ondsel.com'
    response = requests.get(url)
    if response.status_code != 200:
        return None
    answer = response.json()
    if answer["total"] != 1:
        return None
    return answer["data"][0]


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


@app.route('/robots.txt')
def robots_txt():
    r = Response(response=render_template('robots.txt', sitemap_url_base=SELF_URL), status=200, mimetype="text/plain")
    r.headers["Content-Type"] = "text/plain; charset=utf-8"
    return r


@app.route('/sitemap.xml')
def sitemap():
    detail = get_sitemap()
    if detail is None:
        abort(500)
    r = Response(response=render_template('sitemap.xml', detail=detail), status=200, mimetype="application/xml")
    r.headers["Content-Type"] = "text/xml; charset=utf-8"
    return r


if __name__ == '__main__':
    app.run()
