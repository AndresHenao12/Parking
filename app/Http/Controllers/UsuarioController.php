<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UsuarioController extends Controller
{
    public function index(): Response
    {
        $this->authorizeRole(['admin']);

        return Inertia::render('Park/Usuarios/Index', [
            'records' => User::query()
                ->orderBy('name')
                ->get()
                ->map(fn (User $user): array => [
                    'id' => (string) $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeRole(['admin']);

        $validated = $request->validate($this->rules());

        User::create([
            ...$validated,
            'password' => Hash::make($validated['password'] ?? 'password123'),
        ]);

        return redirect()->route('usuarios.index');
    }

    public function update(Request $request, User $usuario): RedirectResponse
    {
        $this->authorizeRole(['admin']);

        $validated = $request->validate($this->rules($usuario));

        $usuario->update([
            ...$validated,
            'password' => $validated['password'] ? Hash::make($validated['password']) : $usuario->password,
        ]);

        return redirect()->route('usuarios.index');
    }

    public function destroy(User $usuario): RedirectResponse
    {
        $this->authorizeRole(['admin']);

        $usuario->delete();

        return redirect()->route('usuarios.index');
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function rules(?User $user = null): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user?->id)],
            'role' => ['required', 'string', 'in:admin,operario'],
            'password' => ['nullable', 'string', 'min:8', $user ? 'sometimes' : 'required'],
        ];
    }
}
