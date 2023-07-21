const UserRouter = require('./UserRouter')
const ProductRouter = require('./ProductRouter')
const CategoryRouter = require('./CategoryRouter')
const PurchaseRouter = require('./PurchaseRouter')
const CommentRouter = require('./CommentRouter')
const EvaluateRouter = require('./EvaluateRouter')
const PaymentRouter = require('./PaymentRouter')
const ChatBoxAIRouter = require('./ChatBoxAIRouter')

const routes = (app) => {
  app.use('/api/user', UserRouter)
  app.use('/api/product', ProductRouter)
  app.use('/api/category', CategoryRouter)
  app.use('/api/purchase', PurchaseRouter)
  app.use('/api/comment', CommentRouter)
  app.use('/api/evaluate', EvaluateRouter)
  app.use('/api/payment', PaymentRouter)
  app.use('/api/chat', ChatBoxAIRouter)
}

module.exports = routes
