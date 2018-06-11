from flask import Flask
from app.config import Config as default_config
from flask_webpack import Webpack
from flask_login import LoginManager


def create_app(config=None):
    """
    Configure app object blueprints and global variables.
    """

    app = configure_app(Flask(__name__), config)

    # setup webpack for assets
    webpack = Webpack()
    webpack.init_app(app)

    # setup flask-login
    login_manager = LoginManager()
    login_manager.init_app(app)

    # setup flask blueprints
    configure_blueprints(app)

    return app


def configure_app(app, config_object=None):
    if config_object:
        app.config.from_object(config_object)
    else:
        app.config.from_object(default_config)

    return app


def configure_blueprints(app):
    from .views.category import category
    from .views.item import item
    from .views.login import login
    from .api.api import api

    for blueprint in [category, item, login, api]:
        app.register_blueprint(blueprint)

    return app
