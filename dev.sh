tmux new -d -s b "cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
tmux new -d -s f "cd frontend && npm run dev"
tmux new -s m
echo "dev environment running"
