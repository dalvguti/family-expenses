<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Inicia sesion con usuario y contrasena (cookie de sesion).
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        try {
            $user = User::where('username', $credentials['username'])->first();
        } catch (QueryException $e) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo conectar con la base de datos.',
            ], 503);
        }

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Usuario o contrasena incorrectos.'],
            ]);
        }

        if (! $user->isActive) {
            throw ValidationException::withMessages([
                'username' => ['Tu cuenta esta desactivada.'],
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        $user->forceFill(['lastLogin' => now()])->save();

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => $user->fresh()->toSafeObject(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Logout successful',
        ]);
    }

    public function getMe(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'user' => $request->user()->toSafeObject(),
        ]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'currentPassword' => ['required', 'string'],
            'newPassword' => ['required', 'string', 'min:6'],
        ]);

        $user = $request->user();

        if (! Hash::check($data['currentPassword'], $user->password)) {
            throw ValidationException::withMessages([
                'currentPassword' => ['La contrasena actual no es correcta.'],
            ]);
        }

        $user->update(['password' => $data['newPassword']]);

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully',
        ]);
    }
}
