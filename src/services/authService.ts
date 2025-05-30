import { supabase } from './supabaseClient';
import type { RegistrationFormData, QuestionnaireData } from '../types';
import { createAgente, createEmpresa, createNewViajero, createStripeUser } from "../hooks/useDatabase";
import { sendAndCreateOTP, verifyOTP } from '../hooks/useEmailVerification';
import { formatDate } from '../helpers/helpers';

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const loginUser = async (email: string, password: string) => {
  try {
    // Validate email format
    if (!validateEmail(email)) {
      throw new Error('El formato del correo electrónico no es válido');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Correo electrónico o contraseña incorrectos');
      }
      throw error;
    }

    if (!data.user) {
      throw new Error('No se pudo iniciar sesión');
    }

    // Check if user is admin
    const isAdmin = email === 'mianoktos@gmail.com';

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.full_name || data.user.email!.split('@')[0],
        isAdmin
      },
      success: true
    };
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
};

export const registerUser = async (
  formData: RegistrationFormData,
  questionnaireData: QuestionnaireData
) => {
  try {
    // Validate email format
    if (!validateEmail(formData.email)) {
      throw new Error('El formato del correo electrónico no es válido');
    }

    // 1. Check if user exists first to avoid rate limit
    const { data: existingUser } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password
    });

    if (existingUser?.user) {
      throw new Error('Este correo electrónico ya está registrado');
    }

    // 2. Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone: formData.phone
        },
        emailRedirectTo: undefined // Disable email confirmation
      }
    });

    if (authError) {
      console.error('Supabase request failed', {
        status: authError.status,
        message: authError.message
      });

      if (authError.message.includes('User already registered')) {
        throw new Error('Este correo electrónico ya está registrado');
      }

      throw new Error('Error al registrar usuario. Por favor intenta de nuevo.');
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario');
    }

    // 3. Create company profile
    const { error: companyError } = await supabase
      .from('company_profiles')
      .insert({
        user_id: authData.user.id,
        company_name: formData.companyName,
        rfc: formData.rfc || null,
        industry: formData.industry,
        city: formData.city
      });

    if (companyError) {
      console.error('Company profile creation error:', companyError);
      throw new Error('Error al crear el perfil de la empresa');
    }

    // 4. Create user preferences
    const { error: preferencesError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: authData.user.id,
        preferred_hotel: questionnaireData.preferredHotel,
        frequent_changes: questionnaireData.frequentChanges === 'yes',
        avoid_locations: questionnaireData.avoidLocations
      });

    if (preferencesError) {
      console.error('User preferences creation error:', preferencesError);
      throw new Error('Error al guardar las preferencias');
    }

    // 5. Sign in the user immediately
    const { data: session } = await supabase.auth.getSession();

    if (!session?.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw new Error('Error al iniciar sesión automáticamente');
      }
    }

    return {
      user: authData.user,
      success: true
    };
  } catch (error: any) {
    console.error('Registration error:', error);

    // Handle specific error cases
    if (error?.message?.includes('duplicate key value')) {
      throw new Error('Este correo electrónico ya está registrado');
    }

    if (error?.message?.includes('Password should be at least 6 characters')) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    // Return a user-friendly error message
    throw new Error(error.message || 'Error al registrar. Por favor intenta de nuevo.');
  }
};


export const newRegisterUser = async (
  formData: RegistrationFormData,
) => {
  try {
    // Validate email format
    if (!validateEmail(formData.correo)) {
      throw new Error('El formato del correo electrónico no es válido');
    }

    // 1. Check if user exists first to avoid rate limit
    const { data: existingUser, error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.correo,
      password: formData.password
    });
    console.log(existingUser);
    if (existingUser?.user) {
      throw new Error('Este correo electrónico ya está registrado');
    }
    const response = await sendAndCreateOTP(formData.correo);
    if (!response.success) {
      throw new Error('No se pudo registrar al usuario');
    }
    return {
      success: true
    };

  } catch (error: any) {
    console.error('Registration error:', error);

    // Handle specific error cases
    if (error?.message?.includes('duplicate key value')) {
      throw new Error('Este correo electrónico ya está registrado');
    }

    if (error?.message?.includes('Password should be at least 6 characters')) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    // Return a user-friendly error message
    throw new Error(error.message || 'Error al registrar. Por favor intenta de nuevo.');
  }
};


export const registerUserAfterVerification = async (formData: any, code: string) => {
  try {
    //1. Verificar que el codigo ingresado es correcto
    const responseVerification = await verifyOTP(formData.correo, code)
    console.log(responseVerification);
    if (!responseVerification.success) {
      throw new Error('Codigo de verificacion incorrecto');
    }
    // // 2. Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.correo,
      password: formData.password,
      options: {
        data: {
          full_name: formData.primer_nombre + ' ' + formData.segundo_nombre + ' ' + formData.apellido_paterno + ' ' + formData.apellido_materno,
          phone: formData.telefono
        },
        emailRedirectTo: undefined // Disable email confirmation
      }
    });

    if (authError) {
      console.error('Supabase request failed', {
        status: authError.status,
        message: authError.message
      });

      if (authError.message.includes('User already registered')) {
        throw new Error('Este correo electrónico ya está registrado');
      }

      throw new Error('Error al registrar usuario. Por favor intenta de nuevo.');
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario');
    }

    // 3. Create agent profile
    const response = await createAgente(formData, authData.user.id);
    if (!response.success) {
      throw new Error("No se pudo registrar al usuario");
    }

    // Create stripe user
    const responseCustomerStripe = await createStripeUser(formData.correo, authData.user.id);
    if (!responseCustomerStripe.success) {
      throw new Error("No se pudo registrar al usuario");
    }

    // 4. Create company profile
    const responseCompany = await createEmpresa(formData, authData.user.id);
    if (!responseCompany.success) {
      throw new Error("No se pudo registrar al usuario");
    }
    console.log(responseCompany);

    // 5. Create viajero profile
    const responseViajero = await createNewViajero(formData, [responseCompany.empresa_id]);
    if (!responseViajero.success) {
      throw new Error("No se pudo registrar al usuario");
    }
    console.log(responseViajero);

    // 6. Sign in the user only if no previous error occurred
    if (responseViajero.success) {
      const { data: session } = await supabase.auth.getSession();

      if (!session?.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.correo, // aquí corregí formData.email a formData.correo
          password: formData.password
        });

        if (signInError) {
          console.error('Sign in error:', signInError);
          throw new Error('Error al iniciar sesión automáticamente');
        }
      }
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific error cases
    if (error?.message?.includes('duplicate key value')) {
      throw new Error('Este correo electrónico ya está registrado');
    }

    if (error?.message?.includes('Password should be at least 6 characters')) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    // Return a user-friendly error message
    throw new Error(error.message || 'Error al registrar. Por favor intenta de nuevo.');
  }

}