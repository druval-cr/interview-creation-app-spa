class ParticipantsController < ApplicationController
    def index
        participants = Participant.all
        render json: participants
    end
end
