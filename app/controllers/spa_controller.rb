# app/controllers/spa_controller.rb
class SpaController < ApplicationController
  def index
    # This renders the application.html.erb layout which loads the React app
    render html: nil, layout: "application"
  end
end
