'use strict';

const mongoose = require('mongoose');
const CONNECTION_STRING = process.env.DB;
mongoose.connect(CONNECTION_STRING, {useNewUrlParser: true});

const Schema = mongoose.Schema;
const IssueSchema = new Schema({
  issue_title: {
    type: String,
    required: true
  },
  issue_text: {
    type: String,
    required: true
  },
  created_by: {
    type: String,
    required: true
  },
  assigned_to: {
    type: String
  },
  status_text: {
    type: String
  },
  created_on: {
    type: Date
  },
  updated_on: {
    type: Date
  },  
  open: {
    type: Boolean
  }
});

module.exports = app => {

  app.route('/api/issues/:project')

  .get((req, res) => {
    const project = req.params.project;
    const Issue = mongoose.model('Issue', IssueSchema, project);
    Issue.find(req.query, (error, data) => {
      if (error) return error;
      res.json(data);
    });
  })
  
  .post((req, res) => {
    const project = req.params.project;
    const Issue = mongoose.model('Issue', IssueSchema, project);
    const issueObj = {
      issue_title: req.body.issue_title,
      issue_text: req.body.issue_text,
      created_by: req.body.created_by,
      assigned_to: req.body.assigned_to || '',
      status_text: req.body.status_text || '',
      created_on: new Date(),
      updated_on: new Date(),
      open: true
    };
    
    if (!issueObj.issue_title || !issueObj.issue_text || !issueObj.created_by) {
      res.send('missing inputs');
    }
    const issue = new Issue(issueObj);
    issue.save((error, savedIssue) => {
      if (error) return error;
      issueObj._id = savedIssue._id;
      res.json(issueObj);
    });
  })

  .put((req, res) => {
    const project = req.params.project;
    const Issue = mongoose.model('Issue', IssueSchema, project);
      
    const ID = req.body._id;
    const obj = req.body;
    delete obj._id;
    
    for (let prop in obj) {
      if (!obj[prop]) delete obj[prop];
    }
    
    if (Object.keys(obj).length === 0) {
      res.send('no updated field sent');
      return;
    }
    
    if (obj.open) obj.open = false;
    
    Issue.findById(ID, (error, data) => {
      if (error) return error; 
      const result = Object.assign(data, obj);
      result.updated_on = new Date();
      data.save((error, result) => error ? res.send('could not update ' + req.body._id) : res.send('successfully updated'));
    });
  })

  .delete((req, res) => {
    const project = req.params.project;
    const Issue = mongoose.model('Issue', IssueSchema, project);
    if (!req.body._id) {
      res.send('_id error');
      return;
    }
    Issue.findOneAndDelete({_id: req.body._id}, (error, data) => {
      if (error) {
        res.send(`could not delete ${req.body._id}`);
      } else {
        res.send(`deleted ${req.body._id}`);
      }
    })
  });
};