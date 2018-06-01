// @flow
import express from 'express';
import App from './app';
import appConfig from './config';

const app = new App(express(), appConfig);
app.init();

export default app;
