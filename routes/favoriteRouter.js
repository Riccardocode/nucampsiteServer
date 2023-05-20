const express = require('express');
const favoriteRouter = express.Router();
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite');
const cors = require('./cors');



favoriteRouter.route('/')
.options(cors.corsWithOptions,(req,res) =>res.sendStatus(200))
.get(cors.cors,authenticate.verifyUser,(req,res,next) =>{
    Favorite.find({user:req.user_id})
    .populate('user')
    .populate('campsites')
    .then(favorite => res.status(200).json(favorite))
    .catch(err => next(err))
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next) =>{
    Favorite.findOne({user:req.user_id})
    .then(favorite =>{
        if(favorite){
            req.body.forEach(fav =>{
                if(!favorite.campsites.includes(fav._id)){
                    favorite.campsites.push(fav._id)
                }

            })
            favorite.save()
            .then(favorite => res.status(200).json(favorite))
            .catch(err => next(err))
        }else{
            Favorite.create({user:req.user._id})
            .then(favorite =>{
                req.body.forEach(fav =>favorite.campsites.push(fav._id))
            })
            .catch(err => next(err))

            favorite.save()
            .then(favorite => res.status(200).json(favorite))
            .catch(err => next(err))
        }
    })
    .catch(err =>next(err))
})
.delete(cors.corsWithOptions, authenticate.verityUser, (req,res,next) =>{
    Favorite.findOneAndDelete({user:req.user._id})
    .then(favorite =>{
        if(favorite){
            res.status(200).json(favorite)
        }else{
            res.status(200).end('You do not have any favoirtes to delete!')
        }
    })
    .catch(err => next(err))
})

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions,(req,res) =>res.sendStatus(200))
.post(cors.corsWithOptions,authenticate.verifyUser, (req,res,next) =>{
    Favorite.findOne({user:req.user._id})
    .then(favorite =>{
        if(favorite){
            if(!favorite.campsites.include(req.params.campsiteId)){
                favorite.campsites.push(req.params.campsiteId);
                favorite.save()
                .then(favorite => res.status(200).json(favorite))
                .catch(err => next(err))
            }else{
                res.status(200).end('Taht campsite is already a favorite!');
            }
        }else{
            Favorite.create({user:req.user._id, campsites:[req.params.campsiteId]})
            .then(favorite => res.status(200).json(favorite))
            .catch(err => next(err))
        }
    })
    .catch(err =>next(err))
})
.delete(cors.corsWithOptions,authenticate.verifyUser, (req,res,next) =>{
    Favorite.findOne({user:req.user._id})
    .then(favorite =>{
        if(favorite){
            const index = favorite.campsites.indexOf(req.params.campsiteId);

            if(index>= 0){
                favorite.campsites.splice(index,1)
                favorite.save()
                .then(favorite => res.status(200).json(favorite))
                .catch(err => next(err))
            }else{
                res.status(200).end('You do not have any favorites to delete!');
            }
        }else{
            res.status(200).end('You do not have any favorites to delete!')
        }
    })
    .catch(err => next(err))
})

module.exports = favoriteRouter;